from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from ocr_api.models import UserProfile


class Command(BaseCommand):
    help = 'Initialize UserProfile records for existing users'

    def handle(self, *args, **options):
        # Create UserProfile for all users that don't have one yet
        users = User.objects.all()
        created_count = 0
        
        for user in users:
            try:
                profile = user.profile
            except UserProfile.DoesNotExist:
                # Determine role: Admin user or superuser gets 'admin', others get 'user'
                role = 'admin' if (user.username == 'Admin' or user.is_superuser) else 'user'
                UserProfile.objects.create(user=user, role=role)
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created profile for user "{user.username}" with role "{role}"')
                )
        
        if created_count == 0:
            self.stdout.write(self.style.SUCCESS('✓ All users already have profiles'))
        else:
            self.stdout.write(
                self.style.SUCCESS(f'✓ Successfully created {created_count} user profile(s)')
            )