"""Builds the full Myaku search result cache in Redis."""

import logging

from myaku import utils
from myaku.datastore.database import MyakuCrawlDb


def main() -> None:
    with MyakuCrawlDb() as db:
        db.build_search_result_cache()


if __name__ == '__main__':
    _log = logging.getLogger('myaku.runners.build_cache')
    utils.toggle_myaku_package_log(filename_base='build_cache')
    try:
        main()
    except BaseException:
        _log.exception('Unhandled exception in main')
        raise