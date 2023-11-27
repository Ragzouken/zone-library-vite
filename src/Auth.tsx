import { useCallback, useContext, useRef } from "react";

import { AppContext } from "./AppContext";

function Auth() {
  const { tryPassword } = useContext(AppContext);

  const elPassword = useRef<HTMLInputElement>(null);
  const onCheck = useCallback(() => {
    tryPassword(elPassword.current?.value ?? "");
  }, [tryPassword, elPassword]);

  return (
    <fieldset>
      <legend>authorization</legend>
      <div className="form-row">
        <label>
          🔑
          <input ref={elPassword} type="password" name="password" autoComplete="current-password" required></input>
        </label>
        <button onClick={onCheck}>check</button>
      </div>
    </fieldset>
  );
}

export default Auth;
