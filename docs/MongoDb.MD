# 🗃️ MongoDB Database Restoration Using Docker

This guide provides a detailed step-by-step process for manually restoring a MongoDB database backup using a Docker container.

---

## ✅ Prerequisites: Ensure MongoDB Server is Running (Server-Side)

Before proceeding with the restoration, ensure the MongoDB server is running on your server machine:

```bash
sudo systemctl status mongod
```

If MongoDB is not active, start it with:

```bash
sudo systemctl start mongod
```

---

## 🟢 Step 1: Create a Database Backup (Server-Side)

To create a backup of the database on your server, use the `mongodump` command:

```bash
mongodump --db leanguagesia --out ~/novalabs/backlanguagesai/labs_nova/backupsdb
```

This command backs up the database `leanguagesia` to the specified directory.

---

## 🟢 Step 2: Identify the MongoDB Docker Container (Local Environment)

Before restoring the database, identify the MongoDB container name using:

```bash
docker ps
```

Locate the container running MongoDB, referred to as `mongodb` in this guide.

---

## 🟢 Step 3: Transfer Backup Files to the Docker Container (Local Environment)

Copy the backup files from your local environment to the Docker container using:

```bash
docker cp labs_nova/backupsdb/leanguagesia mongodb:/backupsdb
```

Explanation:

- `labs_nova/backupsdb/leanguagesia`: Local backup directory.
- `mongodb:/backupsdb`: Destination directory inside the container.

✅ Remove old backups if necessary:

```bash
docker exec -it mongodb bash -c "rm -rf /backupsdb/leanguagesia"
```

---

## 🟢 Step 4: Restore the Database Inside the Docker Container (Local Environment)

1. Access the MongoDB container:

```bash
docker exec -it mongodb bash
```

2. Restore the database using `mongorestore`:

```bash
mongorestore --db leanguagesia /backupsdb/leanguagesia
```

3. Verify the restoration using `mongosh`:

```bash
mongosh
use leanguagesia
show collections
db.words.countDocuments()
```

4. Exit the MongoDB shell and container:

```bash
exit  # Exit mongosh
exit  # Exit container
```

---

## 🎉 Restoration Complete!

Your MongoDB database has been successfully restored using Docker. Repeat these steps as needed, ensuring no data is overwritten unintentionally.
