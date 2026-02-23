import { Button as AntdButton } from 'antd'
import type { ButtonProps as AntdButtonProps } from 'antd'
import type { CSSProperties } from 'react'

type Props = Omit<AntdButtonProps, 'children'> & { text: string; className?: string; style?: CSSProperties }

export default function Button({ text, className = '', style, ...props }: Props) {
  const mergedStyle: CSSProperties = {
    backgroundColor: 'black',
    color: 'white',
    borderColor: 'black',
    ...style,
  }

  return (
    <AntdButton
      {...props}
      style={mergedStyle}
      className={`rounded px-4 py-2 ${className}`}
    >
      {text}
    </AntdButton>
  )
}
