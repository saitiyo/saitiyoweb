import Button from './Button'
import Link from 'next/link'

type Props = {
  title?: string
  description?: string
  buttonLink?: string
  buttonText?: string
  className?: string
}

export default function NoDataComponent({
  title = 'No Projects',
  description = 'You have no projects at the moment',
  buttonLink = '',
  buttonText = 'Add New',
  className = '',
}: Props) {
  // Main Content: Centered Empty State
  return (
    <div className={`flex-grow flex flex-col items-center justify-center ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-medium text-gray-900 mb-1">{title}</h2>
        <p className="text-gray-500 mb-6">{description}</p>
        {buttonLink ? (
          <Link href={buttonLink}>
            <Button text={buttonText} />
          </Link>
        ) : (
          <Button text={buttonText} />
        )}
      </div>
    </div>
  )
}