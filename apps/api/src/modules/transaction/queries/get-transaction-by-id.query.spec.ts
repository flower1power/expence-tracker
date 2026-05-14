import { GetTransactionByIdQuery } from './get-transaction-by-id.query';

describe('GetTransactionByIdQuery', () => {
  it('сохраняет переданный UUID в свойстве id', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const query = new GetTransactionByIdQuery(uuid);
    expect(query.id).toBe(uuid);
  });

  it('принимает пустую строку без ошибок', () => {
    const query = new GetTransactionByIdQuery('');
    expect(query.id).toBe('');
  });
});
