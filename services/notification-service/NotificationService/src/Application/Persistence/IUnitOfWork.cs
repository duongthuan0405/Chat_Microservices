using System.Threading.Tasks;

namespace NotificationService.Application.Persistence;

public interface IUnitOfWork
{
    Task BeginAsync();

    Task FinishAsync();

    Task RollbackAsync();
}
