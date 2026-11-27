import React from 'react'
import {ScrollView, StyleSheet, Text, useColorScheme, View} from 'react-native'

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export type CupStructureFate = {
  kind: 'drop' | 'ko' | 'third_place' | 'none'
  label: string | null
}

export type CupStructureCell = {
  stage_key: string
  round: number
  week: number
  teams: number
  matches: number
  byes: number
  status: string
  current: boolean
  dates: string[]
  fate: CupStructureFate
}

export type CupStructureTableData = {
  columns: Array<{round: number; label: string}>
  rows: Array<{stage_key: string; label: string; cells: CupStructureCell[]}>
}

function formatDay(ymd: string): string {
  const [y, m, d] = ymd.slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return ''
  return `${d} ${MONTHS[m - 1] ?? ''}`
}

function dateLine(dates: string[]): string | null {
  const days = (dates ?? []).map(formatDay).filter(Boolean)
  if (days.length === 0) return null
  if (days.length === 1) return days[0]
  return `${days[0]} +${days.length - 1}`
}

function currentFill(stageKey: string, isDark: boolean): string {
  if (stageKey === 'gold') return isDark ? '#78590a' : '#fcd34d'
  if (stageKey === 'silver') return isDark ? '#475569' : '#e2e8f0'
  if (stageKey === 'bronze') return isDark ? '#9a3412' : '#fdba74'
  return isDark ? '#78350f' : '#fde68a'
}

export function CupStructureTable({
  table,
  title,
}: {
  table: CupStructureTableData | null | undefined
  title?: string
}) {
  const isDark = useColorScheme() === 'dark'
  if (!table || table.rows.length === 0) return null

  const border = isDark ? '#334155' : '#cbd5e1'
  const paper = isDark ? '#0f172a' : '#ffffff'
  const ink = isDark ? '#f8fafc' : '#0f172a'
  const muted = isDark ? '#94a3b8' : '#64748b'
  const header = isDark ? '#020617' : '#1e293b'

  return (
    <View style={{marginTop: 16}}>
      {title ? (
        <Text style={{fontSize: 20, fontWeight: '800', marginBottom: 8, color: ink}}>
          {title}
        </Text>
      ) : null}
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator>
        <View style={[styles.grid, {borderColor: border}]}>
          <View style={[styles.row, {backgroundColor: header}]}>
            <View style={[styles.cupCol, styles.headerCell, {borderColor: border}]}>
              <Text style={styles.headerText}>Cup</Text>
            </View>
            {table.columns.map(col => (
              <View
                key={col.round}
                style={[styles.roundCol, styles.headerCell, {borderColor: border}]}>
                <Text style={[styles.headerText, {textAlign: 'center'}]}>
                  {col.label}
                </Text>
              </View>
            ))}
          </View>
          {table.rows.map(row => (
            <View key={row.stage_key}>
              <View style={[styles.row, {borderTopWidth: StyleSheet.hairlineWidth, borderColor: border}]}>
                <View
                  style={[
                    styles.cupCol,
                    {borderColor: border, backgroundColor: paper, justifyContent: 'center'},
                  ]}>
                  <Text style={{fontWeight: '800', color: ink}}>{row.label}</Text>
                </View>
                {row.cells.map(cell => {
                  const fill =
                    cell.teams >= 2 && cell.current
                      ? currentFill(row.stage_key, isDark)
                      : cell.status === 'complete'
                        ? isDark
                          ? '#111827'
                          : '#f8fafc'
                        : paper
                  const day = dateLine(cell.dates)
                  return (
                    <View
                      key={`${row.stage_key}-${cell.round}`}
                      style={[
                        styles.roundCol,
                        {borderColor: border, backgroundColor: fill, alignItems: 'center'},
                      ]}>
                      {cell.teams >= 2 ? (
                        <>
                          <Text style={[styles.week, {color: muted}]}>
                            Week {cell.week}
                          </Text>
                          <Text style={{color: ink, fontSize: 13}}>
                            {cell.teams} Teams
                          </Text>
                          <Text style={{color: ink, fontSize: 13}}>
                            {cell.matches} Matches
                          </Text>
                          {cell.byes > 0 ? (
                            <Text style={{color: ink, fontSize: 13}}>
                              {cell.byes} Byes
                            </Text>
                          ) : null}
                          {day ? (
                            <Text style={{color: muted, fontSize: 11, marginTop: 2}}>
                              {day}
                            </Text>
                          ) : null}
                        </>
                      ) : (
                        <Text style={{color: muted}}>—</Text>
                      )}
                    </View>
                  )
                })}
              </View>
              <View style={[styles.row, {borderBottomWidth: StyleSheet.hairlineWidth, borderColor: border}]}>
                <View style={[styles.cupCol, {borderColor: border, backgroundColor: paper}]} />
                {row.cells.map(cell => {
                  const ko = cell.fate?.kind === 'ko'
                  return (
                    <View
                      key={`${row.stage_key}-${cell.round}-fate`}
                      style={[
                        styles.roundCol,
                        styles.fateCol,
                        {
                          borderColor: border,
                          backgroundColor: ko
                            ? '#dc2626'
                            : isDark
                              ? '#020617'
                              : '#f8fafc',
                        },
                      ]}>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          textAlign: 'center',
                          color: ko ? '#fff' : isDark ? '#7dd3fc' : '#075985',
                        }}>
                        {cell.fate?.kind === 'drop' && cell.fate.label
                          ? `${cell.fate.label} ↓`
                          : cell.fate?.label ?? ''}
                      </Text>
                    </View>
                  )
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <Text style={{marginTop: 8, fontSize: 12, lineHeight: 16, color: muted}}>
        Highlighted rounds are the current draw. Later rounds are the planned
        size, using the fewest byes that keep an even field. Losers drop into
        the next cup. Teams in red are out.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cupCol: {
    width: 92,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  roundCol: {
    width: 118,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRightWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  fateCol: {
    minHeight: 32,
    paddingVertical: 6,
  },
  headerCell: {
    backgroundColor: 'transparent',
  },
  headerText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  week: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
})
