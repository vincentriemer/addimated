workflow "CI" {
  on = "push"
  resolves = ["Release"]
}

action "Install" {
  uses = "nuxt/actions-yarn@master"
  args = "install --frozen-lockfile"
}

action "Build" {
  uses = "nuxt/actions-yarn@master"
  needs = ["Install"]
  args = "run build"
  env = {
    CI = "true"
  }
}

action "Release" {
  uses = "nuxt/actions-yarn@master"
  needs = ["Build"]
  args = "run semantic-release"
  secrets = ["NPM_TOKEN", "GH_TOKEN"]
  env = {
    CI = "true"
  }
}

