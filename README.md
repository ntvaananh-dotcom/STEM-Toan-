# STEM–Toán — Website bán học liệu trung học

Website HTML/CSS/JavaScript thuần với giao diện tiếng Việt xanh–trắng, phù hợp máy tính và điện thoại. Không cần cài thư viện hoặc chạy bước build.

## Chạy thử

1. Giải nén gói website.
2. Mở `index.html` trong trình duyệt. Nếu trình duyệt hạn chế một số tính năng khi mở tệp trực tiếp, chạy máy chủ cục bộ trong thư mục website:

   ```bash
   python3 -m http.server 8000
   ```

   Sau đó mở `http://localhost:8000`.

3. Các sản phẩm hiện được bật để dễ thử luồng mua hàng. Tên, mô tả, giá và số trang là dữ liệu minh họa; hãy thay bằng nội dung thực trước khi giới thiệu cho khách hàng.

## Tính năng trong bản demo

- Tìm kiếm và lọc học liệu theo cấp học, loại tài liệu; sắp xếp theo giá.
- Xem trước tối đa hai ảnh trang mẫu cho mỗi sản phẩm.
- Giỏ hàng lưu trên trình duyệt, thêm/xóa sản phẩm và tính tổng.
- Mỗi đơn hàng yêu cầu có ít nhất một **Kế hoạch bài dạy** và một **Bản thiết kế STEM**.
- Thanh toán mô phỏng: nhập tên/email rồi bấm xác nhận để lập tức hiện “Thanh toán thành công”. **Không có giao dịch ngân hàng và không thu tiền thật.**
- Sau khi đơn hoàn tất, khách có thể gửi đánh giá kèm video do chính mình chọn từ thiết bị. Hỗ trợ tệp video tối đa 100 MB.
- Khi khách chọn video, website hiển thị bản xem trước và thanh tiến trình tải lên mô phỏng; sau đó hiện thông báo tải lên thành công. Tệp không được gửi lên máy chủ. Video có thể xem lại trong phiên trang hiện tại; tên video, nội dung đánh giá và đơn hàng được lưu cục bộ trên trình duyệt.
- Sau khi gửi đánh giá kèm video, ưu đãi 20% tự động áp dụng cho **đơn hàng kế tiếp**. Ưu đãi chỉ được sử dụng một lần.
- Khu vực đánh giá hiển thị các nhận xét đã tạo; video chỉ phát được trong phiên trình duyệt còn giữ bản xem trước.
- `editor.html` dùng để chỉnh dữ liệu sản phẩm và xuất `content.js`.

## Giới hạn quan trọng

Đây là bản demo tĩnh, chưa có máy chủ. Video được tải lên theo kiểu mô phỏng để phục vụ bài tập; tệp **không được gửi cho chủ cửa hàng, không được lưu bền vững và không tự đồng bộ sang thiết bị/trình duyệt khác**. Đơn hàng, đánh giá và ưu đãi cũng chỉ lưu cục bộ, nên không phù hợp để vận hành bán hàng thật hoặc chống việc tự tạo nhiều mã ưu đãi. Nếu triển khai thật, cần backend để xác thực đơn hàng, nhận và lưu video, quản lý khách hàng/đánh giá và cấp ưu đãi an toàn.

## Cấu trúc

- `index.html`: bố cục cửa hàng, luồng giỏ hàng và khu vực đánh giá.
- `styles.css`: giao diện và responsive.
- `content.js`: thông tin cửa hàng và danh sách học liệu mẫu.
- `app.js`: tìm kiếm, giỏ hàng, thanh toán mô phỏng, đánh giá/video và ưu đãi.
- `editor.html`, `editor.js`: công cụ cập nhật dữ liệu sản phẩm.

Trước khi mở bán thật, thay dữ liệu minh họa, bật trạng thái sản phẩm phù hợp và xây dựng backend/thanh toán thực tế. Không xem trạng thái “thanh toán thành công” trong bản demo là bằng chứng đã nhận tiền.
