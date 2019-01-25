workflow "CI" {
  on = "push"
  resolves = ["Release"]
}

action "Install" {
  uses = "./actions/yarn"
  args = "install --frozen-lockfile"
}

action "Build" {
  uses = "./actions/yarn"
  needs = ["Install"]
  args = "run build"
  env = {
    CI = "true"
  }
}

action "Release" {
  uses = "./actions/yarn"
  needs = ["Build"]
  args = "run semantic-release"
  secrets = ["NPM_TOKEN", "GH_TOKEN"]
  env = {
    CI = "true"
  }
}

