import { Button as AntdButton } from 'antd'
import type { ButtonProps as AntdButtonProps } from 'antd'
import type { CSSProperties } from 'react'
import Link from 'next/link'

type Props = Omit<AntdButtonProps, 'children'> & {
  text: string
  className?: string
  style?: CSSProperties
  link?: string
  htmlType?: "submit" | "button" | "reset"
}

export default function CustomButton({
  text,
  className = '',
  style,
  link,
  htmlType = "button", // Default to button
  ...props
}: Props) {
  const mergedStyle: CSSProperties = {
    backgroundColor: 'black',
    color: 'white',
    borderColor: 'black',
    ...style,
  }

  const buttonElement = (
    <AntdButton
      {...props}
      style={mergedStyle}
      className={`rounded px-4 py-2 ${className}`}
      htmlType={htmlType} // Pass the htmlType to AntdButton
    >
      {text}
    </AntdButton>
  )

  if (link) {
    return (
      <Link href={link}>
        {buttonElement}
      </Link>
    )
  }

  return buttonElement
}
