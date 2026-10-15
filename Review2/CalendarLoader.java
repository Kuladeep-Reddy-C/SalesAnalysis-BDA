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

public class CalendarLoader {

    public static void main(String[] args) {

        String csvFile =
            "/home/kuladeepreddyc/Documents/BigData/calendar_processed_clean.csv";

        String tableName = "retail_calendar";

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

                if (fields.length != 13) {
                    System.out.println("Skipping invalid row: " + line);
                    continue;
                }

                String d = fields[0];
                String date = fields[1];
                String wmYrWk = fields[2];
                String weekday = fields[3];
                String month = fields[4];
                String year = fields[5];
                String eventName1 = fields[6];
                String eventType1 = fields[7];
                String eventName2 = fields[8];
                String eventType2 = fields[9];
                String snapCA = fields[10];
                String snapTX = fields[11];
                String snapWI = fields[12];

                // Row key = d
                Put put = new Put(Bytes.toBytes(d));

                put.addColumn(
                    Bytes.toBytes("calendar"),
                    Bytes.toBytes("date"),
                    Bytes.toBytes(date)
                );

                put.addColumn(
                    Bytes.toBytes("calendar"),
                    Bytes.toBytes("wm_yr_wk"),
                    Bytes.toBytes(wmYrWk)
                );

                put.addColumn(
                    Bytes.toBytes("calendar"),
                    Bytes.toBytes("weekday"),
                    Bytes.toBytes(weekday)
                );

                put.addColumn(
                    Bytes.toBytes("calendar"),
                    Bytes.toBytes("month"),
                    Bytes.toBytes(month)
                );

                put.addColumn(
                    Bytes.toBytes("calendar"),
                    Bytes.toBytes("year"),
                    Bytes.toBytes(year)
                );

                put.addColumn(
                    Bytes.toBytes("calendar"),
                    Bytes.toBytes("event_name_1"),
                    Bytes.toBytes(eventName1)
                );

                put.addColumn(
                    Bytes.toBytes("calendar"),
                    Bytes.toBytes("event_type_1"),
                    Bytes.toBytes(eventType1)
                );

                put.addColumn(
                    Bytes.toBytes("calendar"),
                    Bytes.toBytes("event_name_2"),
                    Bytes.toBytes(eventName2)
                );

                put.addColumn(
                    Bytes.toBytes("calendar"),
                    Bytes.toBytes("event_type_2"),
                    Bytes.toBytes(eventType2)
                );

                put.addColumn(
                    Bytes.toBytes("calendar"),
                    Bytes.toBytes("snap_CA"),
                    Bytes.toBytes(snapCA)
                );

                put.addColumn(
                    Bytes.toBytes("calendar"),
                    Bytes.toBytes("snap_TX"),
                    Bytes.toBytes(snapTX)
                );

                put.addColumn(
                    Bytes.toBytes("calendar"),
                    Bytes.toBytes("snap_WI"),
                    Bytes.toBytes(snapWI)
                );

                table.put(put);

                count++;

                if (count % 100 == 0) {
                    System.out.println(
                        "Loaded " + count + " calendar records..."
                    );
                }
            }

            br.close();
            table.close();
            connection.close();

            System.out.println();
            System.out.println("==================================");
            System.out.println("Calendar loading completed!");
            System.out.println("Total records loaded: " + count);
            System.out.println("==================================");

        } catch (Exception e) {

            System.out.println("Error while loading calendar data:");
            e.printStackTrace();

        }
    }
}
