export type MediaItem = {
  mediaId: string,
  title: string,
  duration: number,
  src: string,
  subtitle?: string,
  tags: string[],
};

export class Client {
  base: string;

  constructor({ base = "." } = {}) {
    this.base = base;
  }

  async requestJSON(path: string, { search = {} as Record<string, string>, auth = "", method = "GET", body = null as BodyInit | null } = {}) {
    const url = new URL(path, this.base);
    url.search = new URLSearchParams(search).toString();
    const init: RequestInit = {
      method,
      headers: {
        "Authorization": "Bearer " + auth,
        "Content-Type": "application/json",
      },
      body,
      mode: "cors",
    };
    return fetch(url, init).then((response) => response.json());
  }

  async requestForm(path: string, { search = {} as Record<string, string>, auth = "", method = "GET", body = null as FormData | null } = {}) {
    const url = new URL(path, this.base);
    url.search = new URLSearchParams(search).toString();
    const init: RequestInit = {
      method,
      headers: {
        "Authorization": "Bearer " + auth,
      },
      body,
      mode: "cors",
    };
    return fetch(url, init).then((response) => response.json());
  }

  async searchLibrary(params: Record<string, string> = {}) {
    return this.requestJSON("/library", { search: params }) as Promise<MediaItem[]>;
  }

  async checkLibraryAuth(auth: string) {
    return this.requestJSON("/library/auth", { method: "POST", auth }) as Promise<{ authorized: boolean }>;
  }

  async getLibraryEntry(id: string) {
    return this.requestJSON("/library/" + id);
  }

  async deleteLibraryEntry(id: string, auth: string) {
    return this.requestJSON("/library/" + id, { method: "DELETE", auth });
  }

  async retitleLibraryEntry(id: string, auth: string, title: string) {
    const body = JSON.stringify({ setTitle: title });
    return this.requestJSON("/library/" + id, { method: "PATCH", auth, body });
  }

  async tagLibraryEntry(id: string, auth: string, ...tags: string[]) {
    const body = JSON.stringify({ addTags: tags });
    return this.requestJSON("/library/" + id, { method: "PATCH", auth, body });
  }

  async untagLibraryEntry(id: string, auth: string, ...tags: string[]) {
    const body = JSON.stringify({ delTags: tags });
    return this.requestJSON("/library/" + id, { method: "PATCH", auth, body });
  }

  async getSizeLimit() {
    const { limit } = await this.requestJSON("/library-limit");
    return limit;
  }

  async uploadMedia(auth: string, media: File, title: string) {
    const body = new FormData();
    body.set("title", title);
    body.set("media", media);
    return this.requestForm("/library", { method: "POST", body, auth });
  }

  async uploadSubtitles(auth: string, id: string, subtitles: File) {
    const body = new FormData();
    body.set("subtitles", subtitles);
    return this.requestForm(`/library/${id}/subtitles`, { method: "PUT", body, auth });
  }
}
