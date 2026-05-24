namespace NotificationService.Presentation.Common;

public class ApiSuccessResponse<T>
{
    public bool Success { get; set; } = true;
    public string Message { get; set; }
    public T Data { get; set; }

    public ApiSuccessResponse(T data, string message = "Request completed successfully.")
    {
        Data = data;
        Message = message;
    }
}
