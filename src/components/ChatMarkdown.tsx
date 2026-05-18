import Markdown, {
  MarkdownIt,
  renderRules as defaultRenderRules,
} from 'react-native-markdown-display'
import React from 'react'
import {ScrollView, View, useColorScheme} from 'react-native'

const markdownItInstance = MarkdownIt({
  typographer: true,
  linkify: true,
})

const COLUMN_MIN_WIDTH = 108
const COLUMN_MAX_WIDTH = 160

export function markdownContainsTable(content: string): boolean {
  return /^\s*\|.+\|\s*$/m.test(content)
}

function getMarkdownTableColumnCount(markdown: string): number {
  let maxCols = 0

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed.includes('|')) {
      continue
    }

    // GFM separator row: | --- | --- |
    if (/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed)) {
      continue
    }

    const parts = trimmed.replace(/^\|/, '').replace(/\|$/, '').split('|')
    maxCols = Math.max(maxCols, parts.length)
  }

  return maxCols
}

type ChatMarkdownProps = {
  content: string
  textColor: string
}

export function ChatMarkdown({content, textColor}: ChatMarkdownProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const borderColor = isDark ? '#374151' : '#d1d5db'
  const headerBg = isDark ? '#14532d' : '#bbf7d0'
  const blockquoteBg = isDark ? 'rgba(15, 23, 42, 0.55)' : 'rgba(0, 0, 0, 0.06)'
  const blockquoteBorder = isDark ? '#6ee7b7' : '#166534'
  const codeBg = isDark ? '#111827' : '#e5e7eb'

  const columnCount = React.useMemo(
    () => getMarkdownTableColumnCount(content),
    [content],
  )
  const columnWidth = React.useMemo(() => {
    if (columnCount <= 0) {
      return COLUMN_MIN_WIDTH
    }
    return Math.max(
      COLUMN_MIN_WIDTH,
      Math.min(COLUMN_MAX_WIDTH, Math.floor(360 / columnCount)),
    )
  }, [columnCount])

  const cellLayout = React.useMemo(
    () => ({
      width: columnWidth,
      flexGrow: 0,
      flexShrink: 0,
    }),
    [columnWidth],
  )

  const markdownStyles = React.useMemo(
    () => ({
      body: {color: textColor},
      text: {color: textColor, fontSize: 15, lineHeight: 21},
      textgroup: {color: textColor},
      paragraph: {
        marginTop: 2,
        marginBottom: 2,
        flexDirection: 'column' as const,
        flexWrap: 'wrap' as const,
        width: '100%',
      },
      strong: {fontWeight: '700' as const, color: textColor},
      em: {fontStyle: 'italic' as const, color: textColor},
      link: {color: isDark ? '#93c5fd' : '#2563eb'},
      bullet_list: {marginVertical: 4},
      ordered_list: {marginVertical: 4},
      blockquote: {
        backgroundColor: blockquoteBg,
        borderLeftWidth: 4,
        borderLeftColor: blockquoteBorder,
        borderColor: blockquoteBorder,
        marginVertical: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 4,
      },
      hr: {
        backgroundColor: borderColor,
        height: 1,
        marginVertical: 12,
      },
      heading1: {color: textColor, fontSize: 22, fontWeight: '700' as const, marginVertical: 8},
      heading2: {color: textColor, fontSize: 20, fontWeight: '700' as const, marginVertical: 8},
      heading3: {color: textColor, fontSize: 18, fontWeight: '600' as const, marginVertical: 6},
      heading4: {color: textColor, fontSize: 16, fontWeight: '600' as const, marginVertical: 6},
      heading5: {color: textColor, fontSize: 15, fontWeight: '600' as const, marginVertical: 4},
      heading6: {color: textColor, fontSize: 14, fontWeight: '600' as const, marginVertical: 4},
      code_inline: {
        backgroundColor: codeBg,
        color: textColor,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 14,
      },
      code_block: {
        backgroundColor: codeBg,
        color: textColor,
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
        fontSize: 13,
        borderWidth: 0,
      },
      fence: {
        backgroundColor: codeBg,
        color: textColor,
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
        fontSize: 13,
        borderWidth: 0,
      },
      table: {
        borderWidth: 1,
        borderColor,
        borderRadius: 8,
        alignSelf: 'flex-start' as const,
      },
      thead: {
        backgroundColor: headerBg,
      },
      tbody: {},
      tr: {
        flexDirection: 'row' as const,
        alignSelf: 'flex-start' as const,
        borderBottomWidth: 1,
        borderColor,
      },
      th: {
        ...cellLayout,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontWeight: '600' as const,
        fontSize: 12,
        color: isDark ? '#ecfdf5' : '#14532d',
        justifyContent: 'center' as const,
      },
      td: {
        ...cellLayout,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
        color: textColor,
        justifyContent: 'center' as const,
      },
    }),
    [
      textColor,
      isDark,
      borderColor,
      headerBg,
      blockquoteBg,
      blockquoteBorder,
      codeBg,
      cellLayout,
    ],
  )

  const tableRules = React.useMemo(
    () => ({
      table: (
        node: {key: string},
        children: React.ReactNode,
        _parent: unknown,
        styles: Record<string, object>,
      ) => (
        <ScrollView
          key={node.key}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator
          style={{marginVertical: 8, flexGrow: 0}}
          contentContainerStyle={{flexGrow: 1}}>
          <View style={styles._VIEW_SAFE_table}>{children}</View>
        </ScrollView>
      ),
      thead: (
        node: {key: string},
        children: React.ReactNode,
        _parent: unknown,
        styles: Record<string, object>,
      ) => (
        <View key={node.key} style={styles._VIEW_SAFE_thead}>
          {children}
        </View>
      ),
      tbody: (
        node: {key: string},
        children: React.ReactNode,
        _parent: unknown,
        styles: Record<string, object>,
      ) => (
        <View key={node.key} style={styles._VIEW_SAFE_tbody}>
          {children}
        </View>
      ),
      tr: (
        node: {key: string},
        children: React.ReactNode,
        _parent: unknown,
        styles: Record<string, object>,
      ) => (
        <View key={node.key} style={styles._VIEW_SAFE_tr}>
          {children}
        </View>
      ),
      th: (
        node: {key: string},
        children: React.ReactNode,
        _parent: unknown,
        styles: Record<string, object>,
      ) => (
        <View
          key={node.key}
          style={[styles._VIEW_SAFE_th, {width: columnWidth, flexGrow: 0, flexShrink: 0}]}>
          {children}
        </View>
      ),
      td: (
        node: {key: string},
        children: React.ReactNode,
        _parent: unknown,
        styles: Record<string, object>,
      ) => (
        <View
          key={node.key}
          style={[styles._VIEW_SAFE_td, {width: columnWidth, flexGrow: 0, flexShrink: 0}]}>
          {children}
        </View>
      ),
    }),
    [columnWidth],
  )

  if (!content.trim()) {
    return null
  }

  return (
    <Markdown
      markdownit={markdownItInstance}
      style={markdownStyles}
      rules={{...defaultRenderRules, ...tableRules}}
      mergeStyle>
      {content}
    </Markdown>
  )
}
