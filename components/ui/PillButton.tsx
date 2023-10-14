import classNames from "classnames"

const PillButton = (props) => {
  let color = props.color || 'teal'
  return (
    <button
      type="button"
      className={classNames(
        "inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-sm font-semibold",
        props.activated ? `bg-teal-600 text-white hover:bg-teal-500` : `bg-teal-50 text-teal-600 hover:bg-teal-100`
      )}
      onClick={props.onClick}
      style={props.style}
    >
      {props.icon && <props.icon className="-mr-0.5 h-5 w-5" aria-hidden="true" />}
      {props.text}
    </button>
  );
};

export default PillButton;