import { padStr } from '../../utils/PadStr';

describe('PadStr', () => {
  it('1 to 001', () => {
    expect(padStr(1, 3)).toEqual('001');
  });
  it('42 to 042', () => {
    expect(padStr(42, 3)).toEqual('042');
  });
  it('151 to 151', () => {
    expect(padStr(151, 3)).toEqual('151');
  });
  it('2021 to 2021', () => {
    expect(padStr(2021, 3)).toEqual('2021');
  });
  it('-18 to -018', () => {
    expect(padStr(-18, 3)).toEqual('-018');
  });
  it('-1999 to -1999', () => {
    expect(padStr(-1999, 3)).toEqual('-1999');
  });
});
