"use client";

import { NavBar } from "@/components/NavBar";
import { useSearchParams } from "next/navigation";

enum Error {
  Configuration = "Configuration",
  AccessDenied = "AccessDenied",
}

const errorMap = {
  [Error.Configuration]: (
    <p>
      There was a problem when trying to authenticate. Please contact us if this
      error persists. Unique error code:{" "}
      <code className="rounded-sm bg-slate-100 p-1 text-xs">Configuration</code>
    </p>
  ),
  [Error.AccessDenied]: (
    <p>
      You need to be signed in with a college email to access the page. Please{" "}
      <a href="/signin" className="text-blue-900 underline">
        sign in
      </a>{" "}
      again to continue.
    </p>
  ),
};

export default function ErrorPage() {
  const search = useSearchParams();
  const error = search.get("error") as Error;

  return (
    <div className="h-screen flex flex-col">
      <NavBar />
      <div
        className="h-full w-full "
        style={{
          backgroundImage: 'url("/background-image.png")',
          backgroundSize: "cover", // Cover the entire div
          backgroundPosition: "center",
        }}
      >
        <div className="flex justify-center items-center h-full">
          <div className="bg-white rounded-lg p-5 w-96 gap-3 flex justify-center flex-col">
            <h1 className="mb-2 flex flex-row items-center justify-center gap-2 text-2xl font-bold tracking-tight text-red-900">
              Something went wrong
            </h1>
            <div className="text-lg text-center">
              {errorMap[error] || (
                <p>
                  There was a problem when trying to authenticate. Please
                  contact us if this error persists.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
