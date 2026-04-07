/**
 * Purpose: Controlled login form for email/password authentication.
 * Direct dependencies: React.
 * Inputs/Outputs: receives field values and callbacks from parent -> emits submit and field change events.
 * Security: Handles user credentials in memory only and delegates network/auth logic to the parent.
 * Notes: UI-only component; no direct API calls here.
 */

export default function LoginForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) {
  return (
    <form className="panel" onSubmit={onSubmit}>
      <h2 className="panel-title">Login</h2>

      <label className="field">
        <span className="field-label">Email</span>
        <input
          className="field-input"
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">Password</span>
        <input
          className="field-input"
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
        />
      </label>

      <button className="primary-button" type="submit">
        Accedi
      </button>
    </form>
  );
}