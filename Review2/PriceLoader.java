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

public class PriceLoader {

    public static void main(String[] args) {

        String csvFile =
            "/home/kuladeepreddyc/Documents/BigData/prices_processed_clean.csv";

        String tableName = "retail_prices";

        try {

            Configuration config = HBaseConfiguration.create();

            Connection connection =
                ConnectionFactory.createConnection(config);

            Table table =
                connection.getTable(TableName.valueOf(tableName));

            BufferedReader br =
                new BufferedReader(new FileReader(csvFile));

            // Skip header
            String line = br.readLine();

            int count = 0;

            while ((line = br.readLine()) != null) {

                String[] fields = line.split(",", -1);

                if (fields.length != 4) {
                    System.out.println("Skipping invalid row: " + line);
                    continue;
                }

                String storeId = fields[0];
                String itemId = fields[1];
                String wmYrWk = fields[2];
                String sellPrice = fields[3];

                // Row key
                String rowKey =
                    storeId + "_" + itemId + "_" + wmYrWk;

                Put put = new Put(Bytes.toBytes(rowKey));

                put.addColumn(
                    Bytes.toBytes("price"),
                    Bytes.toBytes("store_id"),
                    Bytes.toBytes(storeId)
                );

                put.addColumn(
                    Bytes.toBytes("price"),
                    Bytes.toBytes("item_id"),
                    Bytes.toBytes(itemId)
                );

                put.addColumn(
                    Bytes.toBytes("price"),
                    Bytes.toBytes("wm_yr_wk"),
                    Bytes.toBytes(wmYrWk)
                );

                put.addColumn(
                    Bytes.toBytes("price"),
                    Bytes.toBytes("sell_price"),
                    Bytes.toBytes(sellPrice)
                );

                table.put(put);

                count++;

                if (count % 10000 == 0) {
                    System.out.println(
                        "Loaded " + count + " price records..."
                    );
                }
            }

            br.close();
            table.close();
            connection.close();

            System.out.println();
            System.out.println("==================================");
            System.out.println("Price loading completed!");
            System.out.println("Total records loaded: " + count);
            System.out.println("==================================");

        } catch (Exception e) {

            System.out.println("Error while loading price data:");
            e.printStackTrace();

        }
    }
}
