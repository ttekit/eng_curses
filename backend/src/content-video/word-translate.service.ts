import { Injectable } from "@nestjs/common";
import {
  fetch_mymemory_translations,
  should_translate_to_lang,
} from "./word-translate.util";

@Injectable()
export class WordTranslateService {
  async translate_words(
    words: string[],
    targetLang?: string | null,
  ): Promise<Record<string, string | null>> {
    const lang = should_translate_to_lang(targetLang);
    if (!lang) {
      return {};
    }
    return fetch_mymemory_translations(words, lang);
  }
}
