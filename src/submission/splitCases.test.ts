import { splitCases } from './SubmissionTable'

describe('splitCases', () => {
  test('empty string', () => {
    expect(splitCases('')).toEqual([])
  })
  test('10 Ps', () => {
    expect(splitCases('PPPPPPPPPP')).toEqual(['PPPPPPPPPP'])
  })
  test('11 Ps', () => {
    expect(splitCases('PPPPPPPPPPP')).toEqual(['PPPPPPPPPP', 'P'])
  })
  test('11 Ps', () => {
    expect(splitCases('PPPPPPPPPPP')).toEqual(['PPPPPPPPPP', 'P'])
  })
  test('20 Ps', () => {
    expect(splitCases('PPPPPPPPPPPPPPPPPPPP')).toEqual([
      'PPPPPPPPPP',
      'PPPPPPPPPP',
    ])
  })
  test('21 Ps', () => {
    expect(splitCases('PPPPPPPPPPPPPPPPPPPPP')).toEqual([
      'PPPPPPPPPP',
      'PPPPPPPPPP',
      'P',
    ])
  })
  test('21 Ps', () => {
    expect(splitCases('PPPPPPPPPPPPPPPPPPPPP')).toEqual([
      'PPPPPPPPPP',
      'PPPPPPPPPP',
      'P',
    ])
  })
  test('[]', () => {
    expect(splitCases('[]')).toEqual(['[]'])
  })
  test('[P]', () => {
    expect(splitCases('[P]')).toEqual(['[P]'])
  })
  test('2[P]s', () => {
    expect(splitCases('[P][P]')).toEqual(['[P]', '[P]'])
  })
  test('[10Ps]', () => {
    expect(splitCases('[PPPPPPPPPP]')).toEqual(['[PPPPPPPPPP]'])
  })
  test('[11Ps]', () => {
    expect(splitCases('[PPPPPPPPPPP]')).toEqual(['[PPPPPPPPPP', 'P]'])
  })
  test('[20Ps]', () => {
    expect(splitCases('[PPPPPPPPPPPPPPPPPPPP]')).toEqual([
      '[PPPPPPPPPP',
      'PPPPPPPPPP]',
    ])
  })
  test('[21Ps]', () => {
    expect(splitCases('[PPPPPPPPPPPPPPPPPPPPP]')).toEqual([
      '[PPPPPPPPPP',
      'PPPPPPPPPP',
      'P]',
    ])
  })
})
