import { actions } from '../../src/store'

describe('getPost', () => {
  it('makes a request and commits the response', async () => {
    const store = { commit: jest.fn() }

    actions.getPost(store)

    expect(store.commit).toHaveBeenCalledWith('SET_POST', { userId: 1 })
  }) 
})
