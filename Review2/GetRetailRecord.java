import java.io.IOException;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.Connection;
import org.apache.hadoop.hbase.client.ConnectionFactory;
import org.apache.hadoop.hbase.client.Get;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.client.Table;
import org.apache.hadoop.hbase.util.Bytes;

public class GetRetailRecord {

    public static void main(String[] args) {

        Configuration config = HBaseConfiguration.create();

        String tableName = "retail_sales";
        String rowKey = "HOBBIES_1_001_CA_1_validation_d_10";

        try (Connection connection =
                     ConnectionFactory.createConnection(config);
             Table table = connection.getTable(
                     TableName.valueOf(tableName))) {

            // Retrieve the record using its row key
            Get get = new Get(Bytes.toBytes(rowKey));

            Result result = table.get(get);

            if (result.isEmpty()) {
                System.out.println("No record found for: " + rowKey);
                return;
            }

            System.out.println("Record retrieved successfully!");
            System.out.println("Row Key: " +
                    Bytes.toString(result.getRow()));

            System.out.println("\nSales Record Details:");

            System.out.println("Item ID: " +
                    Bytes.toString(result.getValue(
                            Bytes.toBytes("product"),
                            Bytes.toBytes("item_id"))));

            System.out.println("Store ID: " +
                    Bytes.toString(result.getValue(
                            Bytes.toBytes("sales"),
                            Bytes.toBytes("store_id"))));

            System.out.println("Day: " +
                    Bytes.toString(result.getValue(
                            Bytes.toBytes("sales"),
                            Bytes.toBytes("day"))));

            System.out.println("Quantity: " +
                    Bytes.toString(result.getValue(
                            Bytes.toBytes("sales"),
                            Bytes.toBytes("quantity"))));

        } catch (IOException e) {
            System.err.println("Error retrieving record:");
            e.printStackTrace();
        }
    }
}
