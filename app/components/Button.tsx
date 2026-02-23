import { Button as AntdButton } from 'antd'
import type { ButtonProps as AntdButtonProps } from 'antd'
import type { CSSProperties } from 'react'

type Props = AntdButtonProps & { text: string; style?: CSSProperties }

export default function Button({ text, style, ...props }: Props) {
  const mergedStyle: CSSProperties = {
    backgroundColor: 'black',
    color: 'white',
    borderColor: 'black',
    ...style,
  }

  return (
    <AntdButton {...props} style={mergedStyle}>
      {text}
    </AntdButton>
  )
}
