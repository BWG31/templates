#!/bin/bash
# This command copies the transcendence service boilerplate to the current directory
# and replaces placeholder tokens with the provided service name.

read -r -p "Service Name: " SERVICE_NAME

if [[ -z "$SERVICE_NAME" ]]; then
  echo "Error: Service name cannot be empty."
  exit 1
fi

TEMPLATE_DIR="$HOME/.config/templates/transcendence_service_template/serviceBoilerplate"

if [[ ! -d "$TEMPLATE_DIR" ]]; then
  echo "Error: Cannot find service template in: $TEMPLATE_DIR"
  exit 1
fi

cp -R "$TEMPLATE_DIR"/. .

SERVICE_UPPER=$(printf '%s' "$SERVICE_NAME" | awk '{print toupper($0)}')
SERVICE_LOWER=$(printf '%s' "$SERVICE_NAME" | awk '{print tolower($0)}')
SERVICE_CAPITALIZED=$(printf '%s' "$SERVICE_NAME" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')

SED_INPLACE=(-i)
if [[ "$(uname)" == "Darwin" ]]; then
  SED_INPLACE=(-i '')
fi

escape_sed() {
  printf '%s' "$1" | sed 's/[&/\\]/\\&/g'
}

SERVICE_UPPER_ESC=$(escape_sed "$SERVICE_UPPER")
SERVICE_LOWER_ESC=$(escape_sed "$SERVICE_LOWER")
SERVICE_CAPITALIZED_ESC=$(escape_sed "$SERVICE_CAPITALIZED")

while IFS= read -r -d '' relative_path; do
  target="./${relative_path#./}"
  if [[ ! -f "$target" ]]; then
    continue
  fi
  if ! grep -Iq . "$target"; then
    continue
  fi
  sed "${SED_INPLACE[@]}" "s/__SERVICE__/${SERVICE_UPPER_ESC}/g" "$target"
  sed "${SED_INPLACE[@]}" "s/__service__/${SERVICE_LOWER_ESC}/g" "$target"
  sed "${SED_INPLACE[@]}" "s/__Service__/${SERVICE_CAPITALIZED_ESC}/g" "$target"
done < <(cd "$TEMPLATE_DIR" && find . -type f -print0)

rename_path() {
  local src="$1"
  local dir new
  dir=$(dirname "$src")
  new=$(basename "$src")
  local renamed="$new"
  renamed=${renamed//__SERVICE__/$SERVICE_UPPER}
  renamed=${renamed//__service__/$SERVICE_LOWER}
  renamed=${renamed//__Service__/$SERVICE_CAPITALIZED}
  if [[ "$renamed" != "$new" ]]; then
    mv "$src" "$dir/$renamed"
  fi
}

export SERVICE_UPPER SERVICE_LOWER SERVICE_CAPITALIZED

while IFS= read -r -d '' path; do
  rename_path "$path"
done < <(find . -depth \( -name '*__SERVICE__*' -o -name '*__service__*' -o -name '*__Service__*' \) -print0)

echo "Service boilerplate copied and placeholders replaced."
