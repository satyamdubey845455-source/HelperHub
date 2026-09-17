import sqlite3

conn = sqlite3.connect('database.db')

# Read existing schema
cursor = conn.cursor()
cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='bookings'")
row = cursor.fetchone()
if row:
    old_sql = row[0]
    print("Current schema:", old_sql[:200])

# Patch schema to include 'cancelled'
conn.execute("PRAGMA writable_schema = ON")
conn.execute("""
    UPDATE sqlite_master 
    SET sql = REPLACE(sql, 
        "CHECK(status IN ('pending', 'accepted', 'rejected', 'completed'))",
        "CHECK(status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled'))")
    WHERE type='table' AND name='bookings'
""")
conn.execute("PRAGMA writable_schema = OFF")
conn.commit()
conn.isolation_level = None  # autocommit mode
conn.execute("VACUUM")

# Verify
cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='bookings'")
row = cursor.fetchone()
if row:
    print("Updated schema:", row[0][:300])

conn.close()
print("Done! Schema updated successfully.")
