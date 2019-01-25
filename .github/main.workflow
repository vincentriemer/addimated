workflow "CI" {
  on = "push"
  resolves = ["Release", "Pre-Release"]
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

action "Release Develop Filter" {
  uses = "actions/bin/filter@db72a46c8ce298e5d2c3a51861e20c455581524f"
  needs = ["Build"]
  args = "branch develop"
}

action "Release Master Filter" {
  uses = "actions/bin/filter@db72a46c8ce298e5d2c3a51861e20c455581524f"
  needs = ["Build"]
  args = "branch master"
}

action "Pre-Release" {
  uses = "nuxt/actions-yarn@master"
  needs = ["Release Master Filter"]
  args = "run semantic-release"
  secrets = ["NPM_TOKEN", "GH_TOKEN"]
  env = {
    CI = "true"
  }
}

action "Release" {
  uses = "nuxt/actions-yarn@master"
  needs = ["Release Master Filter"]
  args = "run semantic-release"
  secrets = ["NPM_TOKEN", "GH_TOKEN"]
  env = {
    CI = "true"
  }
}

