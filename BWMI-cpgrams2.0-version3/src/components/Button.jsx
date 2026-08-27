import { Link } from 'react-router-dom'

export default function Button({ variant = 'primary', to, children, className = '', ...props }) {
  const classes = `button button--${variant} ${className}`.trim()
  return to ? <Link className={classes} to={to} {...props}>{children}</Link> : <button className={classes} type="button" {...props}>{children}</button>
}
