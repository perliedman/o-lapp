import React, { useState, useEffect, useContext, useRef } from "react";
import { store } from "./store";
import Spinner from "./ui/Spinner";
import useDebounce from "./useDebounce";

export default function Query({
  path,
  children,
  join,
  acceptEmpty,
  empty,
  debounceMs = 200,
}) {
  const {key, state, value, debouncedValue} = useQuery({path, join, debounceMs});
  const valueMissing = state !== "idle" || (!debouncedValue && !acceptEmpty);

  return valueMissing ? (
    <div className="content">
      {state === "loading" ? (
        <Spinner className="text-gray-400" />
      ) : state === "error" ? (
        "Ett fel inträffade :("
      ) : !value ? (
        !acceptEmpty ? (
          empty || "Här är det tomt än så länge!"
        ) : null
      ) : (
        <Spinner className="text-gray-400" />
      )}
    </div>
  ) : (
    children(debouncedValue, key)
  );
}

export function useQuery({path, join, debounceMs = 200}) {
  const [state, setState] = useState("loading");
  const [value, setValue] = useState();
  const [key, setKey] = useState();
  const valueRef = useRef();
  const keyRef = useRef();

  const {
    state: { database },
  } = useContext(store);

  const waitTimer = useRef();

  useEffect(() => {
    const ref = database.ref(path);
    const onError = (error) => {
      console.error("Query error:", error);
      setState("error");
    };

    setState("loading");

    if (!join) {
      ref.on(
        "value",
        (snapshot) => {
          setValue(snapshot.val());
          setKey(snapshot.key);
          setState("idle");
        },
        onError
      );
    } else {
      setValue({});
      ref.once("value", () => {
        waitTimer.current = setTimeout(() => setState("idle"), debounceMs)}, onError);
      ref.on(
        "child_added",
        (snapshot) => {
          const joinRef = database.ref(join(snapshot.key));
          joinRef.once(
            "value",
            (joinSnapshot) => {
              valueRef.current = {
                ...valueRef.current,
                [joinSnapshot.key]: joinSnapshot.val(),
              };
              setValue(valueRef.current);
              setKey((keyRef.current || []).concat(joinSnapshot.key));
              setState("idle");
              clearTimeout(waitTimer.current);
              waitTimer.current = undefined
            },
            onError
          );
        },
        onError
      );
    }

    return () => {
      ref.off();
    };
  }, [database, path, join, debounceMs]);

  const debouncedValue = useDebounce(value, debounceMs);
  return {
    state,
    value,
    debouncedValue,
    key,
  }
}