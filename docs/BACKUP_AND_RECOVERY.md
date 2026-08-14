# LINPAL Backup and Disaster Recovery Strategy

This document outlines the operational backups, credential exports, and recovery protocols for **LINPAL Premium Estates**.

---

## 💾 1. MongoDB Database Backups

The core operational database (properties, bookings, logs, messages, notifications) is backed up utilizing MongoDB Atlas Automated Backups.

### Backup Strategy & Cadence
- **Frequency**: Automated hourly snapshots, compiled into daily and weekly retention layers.
- **Retention Period**:
  - Hourly backups: Retained for 2 days.
  - Daily backups: Retained for 1 week.
  - Weekly backups: Retained for 1 month.
  - Monthly backups: Retained for 1 year.
- **Disaster Recovery Target**: Recovery Point Objective (RPO) is strictly capped at **1 hour**; Recovery Time Objective (RTO) is strictly capped at **15 minutes**.

### Manual Command-Line Backup
To create an instant, zipped snapshot of the database:
```bash
mongodump --uri="mongodb+srv://[user]:[pass]@[cluster].jsjmka9.mongodb.net/linpal" --archive=linpal_backup.gz --gzip
```

### Manual Command-Line Restore
To restore the zipped database snapshot:
```bash
mongorestore --uri="mongodb+srv://[user]:[pass]@[cluster].jsjmka9.mongodb.net/linpal" --archive=linpal_backup.gz --gzip --drop
```

---

## 🔐 2. Firebase Client Identity Exports

Firebase Auth credentials (emails, salts, password hashes, verified flags) are decoupled from the MongoDB layer and backed up via the Firebase CLI.

### Command-Line Export
```bash
firebase auth:export accounts_backup.json --format=json --project=lincon-2f739
```

### Command-Line Restore / Import
To import or restore the identity schema:
```bash
firebase auth:import accounts_backup.json --hash-algo=SCRYPT --project=lincon-2f739
```

---

## 🖼️ 3. Cloudinary Assets Preservation

All property media files and user avatars are hosted securely in Cloudinary.

- **Configuration**: Native automated versioning is active. Modifying or replacing an image creates an incremental backup copy rather than destroying the source asset.
- **Preservation Strategy**: Cloudinary backups are automatically synchronized with an AWS S3 backup bucket in the same region, safeguarding files against CDN outages.
