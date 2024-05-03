Magic in progress...

![output](https://github.com/Llandy3d/kroco6/assets/16627175/7736d612-71af-4564-b141-9da4ff6a4117)

## Install & play

Get the release [here](https://github.com/Llandy3d/kroco6/releases) and enjoy! :)

### Macos

On Macos the operating system will misleadingly say that the file is damaged and to throw it away. This happens because it's not signed, so the alternative to paying 100$ to apple right now is to run this command to remove the quarantine:

```
xattr -d com.apple.quarantine /Applications/kroco6.app/
```


## Requirements (dev)

- Rust
- Npm

## Files

- `src-tauri`: the rust backend
- `src`: the svelte frontend

## Run

`npm run tauri dev`
