import { Client } from "pg";
const args = process.argv.slice(2);

if (args.length !== 4) {
  console.error("Provide db_name, schema, table name, and new table name");
  process.exit(1);
}

const dbname = args[0];
const schema = args[1];
const tableName = args[2];
const newTableName = args[3];

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: dbname,
  port: 5432,
});
client.connect();

console.log("\n---- Rename SQL ----\n");
console.log(`ALTER TABLE ${schema}.${tableName} rename to ${newTableName};`);

client.query(
  `SELECT
        tablename,
        indexname,
        indexdef
    FROM
        pg_indexes
    WHERE
        schemaname = '${schema}' and tablename = '${tableName}';`,
  (err, res) => {
    res.rows.forEach((row) => {
      const tableNameToReplace = `${tableName}_`;
      const indexName = row.indexname;
      const newIndexName = indexName.replace(
        tableNameToReplace,
        `${newTableName}_`
      );
      if (indexName.includes(`${tableName}_`)) {
        console.log(
          `ALTER INDEX ${schema}.${indexName} RENAME TO ${newIndexName};`
        );
      }
    });
    console.log("\n---- End Rename SQL ----\n");
    client.end();
  }
);
