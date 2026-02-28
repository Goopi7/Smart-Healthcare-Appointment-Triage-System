import sqlite3

def run_migration():
    try:
        conn = sqlite3.connect('sql_app.db')
        cursor = conn.cursor()
        
        # Check if column exists
        cursor.execute("PRAGMA table_info(patients)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'gender' not in columns:
            print("Adding 'gender' column to 'patients' table...")
            cursor.execute("ALTER TABLE patients ADD COLUMN gender VARCHAR DEFAULT 'Other'")
            conn.commit()
            print("Migration successful.")
        else:
            print("'gender' column already exists.")
            
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    run_migration()
