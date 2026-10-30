# SnapShare Scaling Plan

SnapShare is a photo-sharing app. Users upload photos and scroll a feed of photos from people they follow.

## 1. Assumptions

- 10 million registered users.
- 10% of them are active each day.
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- An average photo is 2 MB, and each photo also gets a 50 KB thumbnail.
- One day has 86,400 seconds.
- Peak traffic is 5 times the average.
- 1 TB = 1,000,000 MB, to keep the sums simple.
- The feed shows thumbnails; the full 2 MB photo is loaded only when a user opens it.

**Daily active users (DAU):** 10,000,000 x 10% = **1,000,000 users per day**.

## 2. Estimates

### Uploads per second

- Uploads per day: 1,000,000 users x 1 photo = 1,000,000 photos.
- Average: 1,000,000 / 86,400 = **about 11.6 uploads per second**.
- Peak (5x): **about 58 uploads per second**.

### Feed views per second

- Feed views per day: 1,000,000 users x 50 pages = 50,000,000 views.
- Average: 50,000,000 / 86,400 = **about 579 feed views per second**.
- Peak (5x): **about 2,894 feed views per second**.

### Photo storage per year

- Originals: 1,000,000 x 2 MB = 2,000,000 MB = 2 TB per day. Over 365 days: **730 TB**.
- Thumbnails: 1,000,000 x 50 KB = 50 GB per day. Over 365 days: **18.25 TB**.
- Total: **about 748 TB per year** (roughly 0.75 PB).

### Summary table

| Measure | Average | Peak (5x) |
|---|---|---|
| Uploads per second | 11.6 | 58 |
| Feed views per second | 579 | 2,894 |
| Storage per year | 748 TB (730 TB originals + 18.25 TB thumbnails) | - |

At peak upload rate, incoming photo data is about 58 x 2 MB = 116 MB per second (roughly 1 Gbps).

## 3. Read-heavy or write-heavy?

SnapShare is **read-heavy**. There are about 50 feed views for every 1 upload (50 million views against 1 million uploads per day), and each feed page shows many photos, so the real gap in photo requests is even bigger.

What this means for the design:

- Make reads cheap: put a CDN in front of the photos and a cache in front of the database.
- Add a read replica so feed queries do not slow down the main database.
- Keep the write path simple and safe, because it is rare: save the photo, then do heavy work such as thumbnails later in the background.
- Scale the read side first, since that is where most of the load is.

## 4. Why photos do not belong in the database

- **Size:** 730 TB of photos a year would make the database huge, slow to back up and expensive to restore.
- **Cost:** database storage is much more expensive per GB than object storage.
- **Speed:** serving big files through the database uses up connections and memory that queries need.
- **No benefit:** photos are never searched or joined, only stored and fetched whole.

Instead, photo files go into **object storage** (such as Amazon S3 or Google Cloud Storage). It is cheap, almost unlimited and durable, and a CDN can serve files straight from it. The database stores only a small **record** for each photo: the photo id, the owner, the caption, the time, and the object storage key (path) of the original and the thumbnail.

## 5. Architecture diagram

```
                         +---------------------+
                         |  Users (web/mobile) |
                         +----------+----------+
                                    |
              photos / thumbnails   |   API requests (feed, upload, follow)
          +-------------------------+--------------------------+
          |                                                    |
          v                                                    v
   +--------------+                                  +-----------------+
   |     CDN      |                                  |  Load balancer  |
   +------+-------+                                  +--------+--------+
          | (cache miss)                                      |
          v                                         +---------+---------+
   +----------------+                               |         |         |
   | Object storage |                               v         v         v
   | (originals +   |                          +-------+ +-------+ +-------+
   |  thumbnails)   |                          | App   | | App   | | App   |
   +-------+--------+                          |server | |server | |server |
           ^                                   +---+---+ +---+---+ +---+---+
           |                                       |         |         |
           |                       +---------------+---------+---------+
           |                       |               |                   |
           |                       v               v                   v
           |                 +-----------+   +-------------+     +-------------+
           |                 |   Cache   |   | Primary DB  |     |    Queue    |
           |                 | (feed,    |   | (writes)    |     | (thumbnail  |
           |                 |  metadata)|   +------+------+     |  jobs)      |
           |                 +-----------+          |            +------+------+
           |                                        | replication       |
           |                                        v                   v
           |                                 +-------------+     +-------------+
           |                                 | Read replica|     |   Worker    |
           |                                 | (feed reads)|     | (makes      |
           |                                 +-------------+     | thumbnails) |
           |                                                     +------+------+
           |                                                            |
           +------------------------------------------------------------+
                      worker reads the original, saves the thumbnail
```

Reads: app servers check the cache first, then the read replica. Writes go to the primary database. Photo files never pass through the database.

## 6. Components: the problem each one solves

- **CDN:** it serves photos and thumbnails from servers close to the user, so pages load fast and most image traffic never reaches our servers.
- **Load balancer:** it spreads incoming requests across many app servers and stops sending traffic to a server that has failed.
- **App servers:** they run the SnapShare logic (login, feed, upload) and are stateless, so we can add more when traffic grows.
- **Cache:** it keeps hot data such as feed results and photo records in memory, so repeated reads do not hit the database.
- **Database (primary):** it stores users, follows, photo records and likes safely and consistently, and takes all the writes.
- **Read replica:** it is a copy of the database that answers feed reads, so heavy reading does not slow down writes on the primary.
- **Object storage:** it stores the huge number of photo files cheaply and durably, which the database cannot do well.
- **Queue:** it holds thumbnail jobs so an upload can finish quickly and traffic spikes are smoothed out instead of overloading the workers.
- **Worker:** it takes jobs from the queue and creates the 50 KB thumbnails in the background, away from the user's request.

## 7. Upload flow, step by step

1. The user picks a photo in the app and taps Upload.
2. The app sends a request to the load balancer, which passes it to an app server.
3. The app server checks that the user is logged in and that the file type and size are allowed.
4. The app server creates a photo record in the primary database with status `processing`, and returns a temporary signed upload link for the object storage.
5. The app uploads the 2 MB original directly to object storage with that link, so the file never goes through the app server.
6. The app tells the app server the upload finished, and the server puts a "create thumbnail" job (photo id and storage key) on the queue.
7. A worker takes the job, downloads the original from object storage and makes a 50 KB thumbnail.
8. The worker saves the thumbnail in object storage and updates the photo record in the database to status `ready` with the thumbnail key.
9. The worker clears the related cache entries, so the new photo can appear in followers' feeds.
10. Followers load their feed from the cache or read replica, and the CDN serves the thumbnail. If the job fails, the queue retries it.

## 8. Trade-offs

- **Caching: speed vs freshness.** A cache makes feeds fast and protects the database, but cached data can be slightly old, so a new photo might take a few seconds to appear. It also adds a component to run and invalidate correctly. Short expiry times reduce staleness, and for a photo feed a small delay is acceptable.
- **Read replica: scale vs consistency.** The replica handles the heavy read load, but it copies data from the primary with a small delay (eventual consistency). A user might not see their own new photo for a moment. We can read a user's own recent uploads from the primary to hide this.
- **Asynchronous thumbnails: fast uploads vs a short wait.** Using a queue and worker keeps uploads quick and handles spikes, but the thumbnail is not ready instantly, so the photo shows as `processing` for a short time. The system also becomes more complex, because we must monitor the queue and retry failed jobs.
- **CDN and object storage: cost vs performance.** A CDN gives fast loading worldwide, but we pay for it, and storing about 748 TB a year is a large ongoing cost. We can reduce cost by moving old photos to cheaper storage and by keeping only the thumbnail and a compressed version of rarely viewed photos.
