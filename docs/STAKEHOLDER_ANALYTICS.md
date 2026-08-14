# MongoDB Analytics & Aggregations Design Guide

To achieve premium mobile rendering speeds under high database volumes, the Stakeholder backend queries avoid manual memory-loop filtering inside Node.js. All metrics compilation processes rely exclusively on native MongoDB aggregation pipelines and compound indexes.

---

## 🏎️ Performance Optimizations
1.  **Strict Index Coverage**: Every period-scoped aggregation runs matches on field indexes like `{ status: 1, publishedAt: -1 }` or `{ actorFirebaseUid: 1, createdAt: -1 }`.
2.  **No Full Table Scans**: Queries always include a preceding `$match` stage narrowing the active range before performing high-cost `$lookup` joins.
3.  **Svelte Document Projection**: Projected subdocuments filter out unneeded attributes immediately, keeping Mongo cache footprints minimal.

---

## 📊 Aggregation Pipelines Breakdown

### 1. Broker Network Performance Compilation
The Realtor performance workspace compiles statistics by joining active Realtor accounts with Property listings and Bookings (inspections) collections.

```javascript
UserModel.aggregate([
  { $match: { role: "realtor", status: "active" } },
  {
    $lookup: {
      from: "properties",
      localField: "_id",
      foreignField: "realtorId",
      as: "properties"
    }
  },
  {
    $lookup: {
      from: "bookings",
      localField: "_id",
      foreignField: "realtorId",
      as: "bookings"
    }
  },
  {
    $project: {
      fullName: 1,
      email: 1,
      agency: 1,
      activeListingsCount: {
        $size: {
          $filter: {
            input: "$properties",
            as: "p",
            cond: { $eq: ["$$p.status", "active"] }
          }
        }
      },
      completedInspectionsCount: {
        $size: {
          $filter: {
            input: "$bookings",
            as: "b",
            cond: { $eq: ["$$b.status", "completed"] }
          }
        }
      }
    }
  }
])
```

### 2. Operational Health Check Rates
Compiles pending reviews, unresolved incidents, and scheduled inspections asynchronously via optimized counts:
*   **Reviews**: `Property.countDocuments({ status: "pending" })`
*   **Issues**: `Issue.countDocuments({ status: { $ne: "resolved" } })`
*   **Upcoming Bookings**: `Booking.countDocuments({ status: { $in: ["pending", "confirmed"] }, scheduledAt: { $gte: new Date() } })`
