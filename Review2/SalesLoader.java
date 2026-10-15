import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.Connection;
import org.apache.hadoop.hbase.client.ConnectionFactory;
import org.apache.hadoop.hbase.client.Put;
import org.apache.hadoop.hbase.client.Table;
import org.apache.hadoop.hbase.util.Bytes;

import java.io.BufferedReader;
import java.io.FileReader;

public class SalesLoader {

    public static void main(String[] args) {

        String csvFile = "/home/kuladeepreddyc/Documents/BigData/sales_processed_clean.csv";
        String tableName = "retail_sales";

        int batchSize = 1000;
        int count = 0;

        try {

            // Load HBase configuration
            Configuration config = HBaseConfiguration.create();

            // Connect to HBase
            Connection connection = ConnectionFactory.createConnection(config);
            Table table = connection.getTable(TableName.valueOf(tableName));

            BufferedReader br = new BufferedReader(new FileReader(csvFile));

            // Skip CSV header
            String line = br.readLine();

            Put[] batch = new Put[batchSize];
            int batchCount = 0;

            while ((line = br.readLine()) != null) {

                String[] fields = line.split(",", -1);

                // Expected columns:
                // 0=id
                // 1=item_id
                // 2=dept_id
                // 3=cat_id
                // 4=store_id
                // 5=state_id
                // 6=d
                // 7=sales

                if (fields.length != 8) {
                    System.out.println("Skipping invalid row: " + line);
                    continue;
                }

                String id = fields[0];
                String itemId = fields[1];
                String deptId = fields[2];
                String catId = fields[3];
                String storeId = fields[4];
                String stateId = fields[5];
                String day = fields[6];
                String sales = fields[7];

                // Row key = id + "_" + day
                // Example:
                // HOBBIES_1_001_CA_1_validation_d_1
                String rowKey = id + "_" + day;

                Put put = new Put(Bytes.toBytes(rowKey));

                // Product column family
                put.addColumn(
                    Bytes.toBytes("product"),
                    Bytes.toBytes("item_id"),
                    Bytes.toBytes(itemId)
                );

                put.addColumn(
                    Bytes.toBytes("product"),
                    Bytes.toBytes("dept_id"),
                    Bytes.toBytes(deptId)
                );

                put.addColumn(
                    Bytes.toBytes("product"),
                    Bytes.toBytes("cat_id"),
                    Bytes.toBytes(catId)
                );

                // Sales column family
                put.addColumn(
                    Bytes.toBytes("sales"),
                    Bytes.toBytes("store_id"),
                    Bytes.toBytes(storeId)
                );

                put.addColumn(
                    Bytes.toBytes("sales"),
                    Bytes.toBytes("state_id"),
                    Bytes.toBytes(stateId)
                );

                put.addColumn(
                    Bytes.toBytes("sales"),
                    Bytes.toBytes("day"),
                    Bytes.toBytes(day)
                );

                put.addColumn(
                    Bytes.toBytes("sales"),
                    Bytes.toBytes("quantity"),
                    Bytes.toBytes(sales)
                );

                batch[batchCount] = put;
                batchCount++;
                count++;

                // Send batch to HBase
                if (batchCount == batchSize) {

                    for (int i = 0; i < batchCount; i++) {
                        table.put(batch[i]);
                    }

                    batchCount = 0;

                    if (count % 10000 == 0) {
                        System.out.println(
                            "Loaded " + count + " records..."
                        );
                    }
                }
            }

            // Load remaining records
            for (int i = 0; i < batchCount; i++) {
                table.put(batch[i]);
            }

            br.close();
            table.close();
            connection.close();

            System.out.println();
            System.out.println("==================================");
            System.out.println("Loading completed successfully!");
            System.out.println("Total records loaded: " + count);
            System.out.println("==================================");

        } catch (Exception e) {

            System.out.println("Error while loading data:");
            e.printStackTrace();

        }
    }
}
