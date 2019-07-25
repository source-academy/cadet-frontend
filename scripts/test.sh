#! /usr/bin/env bash

export CI=true

main() {
    run_cmd "git stash push --keep-index --message precommit"
    echo "  If you cancel this pre-push hook, use \`git stash pop\` to retrieve your"
    echo "  unstaged changes."

    tslint="npm run tslint"
    prettier_ts="npm run format:tsx"
    prettier_scss="npm run format:scss"
    jest_ts="npm test"

    run_cmd "${tslint}"; tslint_exit=$?
    run_cmd "${prettier_ts}"; prettier_ts_exit=$?
    run_cmd "${prettier_scss}"; prettier_scss_exit=$?
    run_cmd_jest "${jest_ts}"; jest_ts_exit=$?

    run_cmd "git stash pop"

    ( >&2
        echo -ne "\033[0;31m"
        [ "${tslint_exit}" -eq "0" ] || echo "TSLint failed"
        [ "${prettier_ts_exit}" -eq "0" ] || echo "Prettier failed for *.{ts,tsx}"
        [ "${prettier_scss_exit}" -eq "0" ] || echo "Prettier failed for *.scss"
        [ "${jest_ts_exit}" -eq "0" ] || echo "Jest failed"
        echo -ne "\033[0m"
    )

    [[ $(( tslint_exit + prettier_ts_exit + prettier_scss_exit + jest_ts_exit )) -eq "0" ]]
}

run_cmd() {
    echo_cyan "> $1"

    print=$($1 2>&1 1> /dev/null)
    exit_status=$?
    if [[ ! -z "${print}" ]]; then
        echo "${print}" | sed 's/^/  /'
    fi

    return "${exit_status}"
}

run_cmd_jest() {
    # modified run_cmd for jest, because jest prints all messages to stderr
    echo_cyan "> $1"

    print=$($1 2>&1 1> /dev/null)
    exit_status=$?
    echo -n "${print}" | grep -v PASS | grep -v -E ^$ | sed 's/^/  /'

    return "${exit_status}"
}

echo_cyan() {
    echo -ne "\033[0;36m"
    echo "$1"
    echo -ne "\033[0m"
}

main
