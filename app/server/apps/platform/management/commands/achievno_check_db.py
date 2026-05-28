from django.core.management.base import BaseCommand, CommandError

from apps.platform.infrastructure.db_health import check_database_health


class Command(BaseCommand):
    help = "Check Achievno database connectivity and baseline schema objects."

    def handle(self, *args, **options):
        result = check_database_health()

        if not result.connected:
            self.stderr.write(f"database connection failed: {result.error}")
            raise CommandError("database connection failed")

        self.stdout.write("database connection ok")
        self.stdout.write(f"database vendor: {result.vendor}")
        if result.server_version:
            self.stdout.write(f"database server version: {result.server_version}")

        if result.error:
            self.stderr.write(result.error)
            raise CommandError("schema sanity failed")

        if result.missing_required_tables:
            self.stderr.write("missing required tables:")
            for table_name in result.missing_required_tables:
                self.stderr.write(f"- {table_name}")
            raise CommandError("required tables missing")

        self.stdout.write("required tables ok")

        for warning in result.warnings:
            self.stderr.write(f"warning: {warning}")

        self.stdout.write("schema sanity ok")
