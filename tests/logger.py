"""Separate module to handle framework logging"""
import logging


def get_logger(log_level: int) -> logging.Logger:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        '%(asctime)s.%(msecs)03d | %(levelname)8s | %(message)s'
    ))
    logger = logging.getLogger()

    if logger.handlers:
        logger.handlers.clear()

    logger.addHandler(handler)
    logger.setLevel(log_level)

    return logger
