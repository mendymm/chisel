import { dag, argument, Container, Directory, object, func, check } from "@dagger.io/dagger";

@object()
export class Chisel {
  rustContainer(): Container {
    return dag
      .container()
      .from("docker.io/rust:1.95-alpine")
      .withExec(["rustup", "component", "add", "rustfmt", "clippy"])
      .withExec(["cargo", "install", "--locked", "cargo-deny"])
      .withExec(["cargo", "install", "cargo-sort"])
      .withExec(["apk", "add", "--no-cache", "git"]);
  }

  /**
  /**
   * run a rustfmt check
   */
  @func()
  @check()
  async rustfmtCheck(
    @argument({ ignore: [".git", "target"], defaultPath: "/" }) rootDir: Directory,
  ): Promise<string> {
    return this.rustContainer()
      .withMountedDirectory("/src", rootDir)
      .withWorkdir("/src")
      .withExec(["cargo", "fmt", "--check"])
      .stdout();
  }

  /**
   * run cargo sort check
   */
  @func()
  @check()
  async cargoSortCheck(
    @argument({ ignore: [".git", "target"], defaultPath: "/" }) rootDir: Directory,
  ): Promise<string> {
    return this.rustContainer()
      .withMountedDirectory("/src", rootDir)
      .withWorkdir("/src")
      .withExec(["cargo", "sort", "--workspace", "--check"])
      .stdout();
  }

  /**
   * run a rustfmt check
   */
  @func()
  @check()
  async cargoDenyCheck(
    @argument({ ignore: [".git", "target"], defaultPath: "/" }) rootDir: Directory,
  ): Promise<string> {
    // const advisoryDb = dag.git("https://github.com/rustsec/advisory-db").branch("main").tree();

    return this.rustContainer()
      .withMountedDirectory("/src", rootDir)
      .withWorkdir("/src")
      .withMountedCache("/usr/local/cargo/advisory-dbs/", dag.cacheVolume("cargo-advisory-db"))
      .withExec(["cargo", "deny", "check", "all"])
      .stdout();
  }

  /**
   * base container after running cargo check
   */
  cargoCheckContainer(rootDir: Directory): Container {
    return this.rustContainer()
      .withMountedDirectory("/src", rootDir)
      .withWorkdir("/src")
      .withMountedCache("/usr/local/cargo/registry", dag.cacheVolume("cargo-registry"))
      .withMountedCache("/src/target", dag.cacheVolume("cargo-target"))
      .withExec(["cargo", "check", "--workspace"]);
  }

  /**
   * run cargo check
   */
  @func()
  @check()
  async cargoCheck(
    @argument({ ignore: [".git", "target"], defaultPath: "/" }) rootDir: Directory,
  ): Promise<string> {
    return this.cargoCheckContainer(rootDir).stdout();
  }
  /**
   * run cargo clippy
   */
  @func()
  @check()
  async cargoClippy(
    @argument({ ignore: [".git", "target"], defaultPath: "/" }) rootDir: Directory,
  ): Promise<string> {
    return this.cargoCheckContainer(rootDir)
      .withExec(["cargo", "clippy", "--", "-D", "warnings"])
      .stdout();
  }
}
