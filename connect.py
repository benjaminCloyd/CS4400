import mysql.connector

cnx = mysql.connector.connect(
    # your password will be different depedning on your device
    user="root",
    password="password1",
    host="127.0.0.1",
    database="reward_program",
)
cnx.close()
