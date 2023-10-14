import classNames from "classnames";

const UiButton = ({ text, size = 'md', onClick, isPrimary = true, isSecondary = false }) => {
  const baseClassNames = "min-w-[80px] inline-flex items-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"

  const colorClassNames =
    isSecondary ? "bg-teal-100 border-transparent text-teal-700 hover:bg-teal-200"
      : isPrimary
        ? "bg-teal-500 border-transparent text-white hover:bg-teal-400"
        : "bg-white border-teal-200 text-teal-900 hover:bg-teal-100"

  const sizeClassNames = (
    size === 'sm' ? "rounded px-2.5 py-1.5 text-xs" :
      size === 'lg' ? "rounded-md px-4 py-2 text-base" : "rounded-md px-4 py-2 text-sm"
  )

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(baseClassNames, colorClassNames, sizeClassNames)}
    >
      <span className="m-auto">
        {text}
      </span>
    </button>
  )
}

export default UiButton;
