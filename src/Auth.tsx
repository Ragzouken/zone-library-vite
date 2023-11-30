import { useCallback, useContext, useRef } from "react";

import { AppContext } from "./AppContext";

function Auth() {
  const { state, dispatch } = useContext(AppContext);

  const tryPassword = useCallback((password: string) => {
    state.client.checkLibraryAuth(password).then(({ authorized }) => {
      if (authorized) dispatch({ type: "password", password });
    });
  }, [dispatch, state.client]);

  const refPassword = useRef<HTMLInputElement>(null);
  const onCheck = useCallback(() => {
    tryPassword(refPassword.current?.value ?? "");
  }, [tryPassword]);

  return (
    <fieldset>
      <legend>authorization</legend>
      <div className="form-row">
        <label>
          🔑
          <input ref={refPassword} type="password" name="password" autoComplete="current-password" required></input>
        </label>
        <button onClick={onCheck}>check</button>
      </div>
    </fieldset>
  );
}

export default Auth;
