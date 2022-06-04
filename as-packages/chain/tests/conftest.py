# content of conftest.py
import pytest


def pytest_addoption(parser):
    parser.addoption(
        "--test-name", action="store", default="", help="test name"
    )


@pytest.fixture
def test_name(request):
    return request.config.getoption("--test-name")

