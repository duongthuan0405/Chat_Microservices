using System.Threading.Tasks;

namespace ChatService.Application.Persistence;

public interface IUnitOfWork
{
    Task BeginAsync();

    Task FinishAsync();

    Task RollbackAsync();
}
