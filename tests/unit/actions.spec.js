import { actions } from '../../src/store'

describe('getPost', () => {
  it('makes a request and commits the response', async () => {
    actions.getPost()

    expect(store.commit).toHaveBeenCalledWith('SET_POST', { userId: 1 })
  }) 
})
