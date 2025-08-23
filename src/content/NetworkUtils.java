package bbs.yuchen.icu;
import android.util.Log;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
public class NetworkUtils {
    private static final String TAG = "NetworkUtils";
    private static final int CONNECT_TIMEOUT = 10000; // 10秒连接超时
    private static final int READ_TIMEOUT = 15000;    // 15秒读取超时

    /**
     * 从给定的 URL 获取字符串内容。
     * 这个方法应该在后台线程中被调用。
     *
     * @param urlString 要请求的 URL.
     * @return 从 URL 返回的字符串内容，如果失败则返回 null.
     */
    public static String fetchContentFromUrl(String urlString) {
        HttpURLConnection connection = null;
        BufferedReader reader = null;

        try {
            URL url = new URL(urlString);
            connection = (HttpURLConnection) url.openConnection();

            // 设置请求方法为 GET
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(CONNECT_TIMEOUT);
            connection.setReadTimeout(READ_TIMEOUT);

            // 连接到服务器
            connection.connect();

            // 检查 HTTP 响应码
            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                Log.e(TAG, "HTTP Error: " + responseCode + " for URL: " + urlString);
                return null;
            }

            // 读取响应流
            InputStream stream = connection.getInputStream();
            reader = new BufferedReader(new InputStreamReader(stream));
            StringBuilder buffer = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                buffer.append(line).append("\n");
            }

            return buffer.toString();

        } catch (IOException e) {
            Log.e(TAG, "Error fetching content from URL: " + urlString, e);
            return null;
        } finally {
            // 确保资源被关闭
            if (connection != null) {
                connection.disconnect();
            }
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    Log.e(TAG, "Error closing reader", e);
                }
            }
        }
    }

}
