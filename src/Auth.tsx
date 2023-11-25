import { SyntheticEvent, useCallback, useContext } from "react";

import { AppContext } from "./AppContext";

function Auth() {
  const { tryPassword } = useContext(AppContext);

  const onSubmit = useCallback((event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password") as string;
    tryPassword(password);
  }, [tryPassword]);
  
  return (
    <form onSubmit={onSubmit}>
      <fieldset>
        <legend>authorization</legend>
        <label>
          🔑
          <input type="password" name="password" autoComplete="current-password" required></input>
        </label>
        <input type="submit" value="check" />
      </fieldset>
    </form>
  ); 
}

export default Auth;
