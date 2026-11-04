# Selection Ask

Bôi đen một đoạn trong câu trả lời của agent rồi hỏi ngay về đoạn đó, mà không phải
gõ thêm một lượt vào ô chat.

## Cách dùng

1. Bôi đen (highlight) một từ, một cụm thuật ngữ hoặc một đoạn trong chat.
2. Một nút nhỏ **Hỏi về đoạn này** hiện ra ngay dưới chỗ bôi đen.
3. Bấm vào nút đó: popup mở ra với đoạn đã chọn ở trên và ô nhập ở dưới.
4. Gõ câu hỏi, nhấn **Enter** (Shift+Enter để xuống dòng). Câu trả lời hiện dần
   ngay trong popup, và có thể hỏi tiếp ngay trong popup đó.

`Esc`, nút **X**, hoặc bấm ra ngoài để đóng. Nút **Dừng** cắt câu trả lời đang chạy.

## Vì sao không làm loãng phiên chat

Popup gọi model bằng một request phụ riêng, **không** ghi gì vào Session: không có
message, không có tool call, không có event nào trong log. Vì vậy hỏi bao nhiêu lần
cũng không đổi ngữ cảnh, không tốn lượt, không làm lệch hội thoại chính. Đóng popup
là mất phần hỏi đáp đó (nó chỉ nằm trong bộ nhớ trang).

Đoạn bôi đen, phần văn bản xung quanh (khối lớn nhất quanh chỗ bôi đen mà còn
≤ ~12.000 ký tự — hội thoại ngắn thì gửi cả, hội thoại dài thì gửi đúng message
hoặc lượt chứa đoạn đó), và các câu hỏi trước trong cùng popup được gửi tới model
của bạn để trả lời.

## Cấu hình

Mặc định plugin dùng model đang chọn mặc định của Harness. Có thể ghim một route
riêng hoặc đổi giới hạn bằng `config` của row trong `cordis.patch.yml`:

```yaml
- insert:
    - id: selection-ask
      name: '@local/selection-ask'
      config:
        provider: deepseek
        model: deepseek-v4
        maxTokens: 800
        systemPrompt: 'Chỉ trả lời đúng câu hỏi, ngắn gọn, bằng tiếng Việt.'
```

| Khoá | Ý nghĩa |
|---|---|
| `provider`, `model` | Ghim route cho phần hỏi nhanh (phải khai báo cùng nhau). Bỏ trống thì dùng model mặc định. |
| `maxTokens` | Giới hạn độ dài câu trả lời, mặc định 800. |
| `systemPrompt` | Thay toàn bộ chỉ dẫn hệ thống của popup. |

## Giới hạn đã biết

- Nút **Hỏi** chỉ hiện với những vùng đọc được (không hiện khi bôi đen trong ô nhập
  của composer, trong sidebar, hay trong chính popup).
- Popup neo theo toạ độ của đoạn bôi đen tại lúc chọn; cuộn trang thì nút ẩn đi, popup
  đang mở vẫn giữ nguyên chỗ.
- Route `/dsh-selection-ask/ask` chạy trên web server cục bộ của Harness, giống các
  panel khác của app; không có thêm lớp xác thực riêng.
