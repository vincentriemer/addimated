workflow "New workflow" {
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

action "Release Branch" {
  uses = "actions/bin/filter@db72a46c8ce298e5d2c3a51861e20c455581524f"
  needs = ["Build"]
  args = "branch 'master|develop'"
}

action "Release" {
  uses = "nuxt/actions-yarn@master"
  needs = ["Release Branch"]
  args = "run semantic-release"
  secrets = ["NPM_TOKEN", "GH_TOKEN"]
  env = {
    CI = "true"
  }
}